package handlers

import (
	"crypto/rand"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// 验证码存储结构
type CaptchaStore struct {
	mu    sync.RWMutex
	store map[string]CaptchaInfo
}

type CaptchaInfo struct {
	X        int
	CreateAt time.Time
}

var captchaStore = CaptchaStore{
	store: make(map[string]CaptchaInfo),
}

// 清理过期的验证码（5分钟过期）
func cleanExpiredCaptchas() {
	captchaStore.mu.Lock()
	defer captchaStore.mu.Unlock()
	now := time.Now()
	for token, info := range captchaStore.store {
		if now.Sub(info.CreateAt) > 5*time.Minute {
			delete(captchaStore.store, token)
		}
	}
}

// 定期清理
func init() {
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			cleanExpiredCaptchas()
		}
	}()
}

// 生成随机字符串token
func generateToken() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 32)
	for i := range b {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		b[i] = chars[n.Int64()]
	}
	return string(b)
}

// 生成随机X位置
func randomX() int {
	// 150 ~ 280
	n, _ := rand.Int(rand.Reader, big.NewInt(131))
	return 150 + int(n.Int64())
}

// GET /api/v1/captcha - 获取验证码
func GetCaptcha(c *gin.Context) {
	token := generateToken()
	x := randomX()

	captchaStore.mu.Lock()
	captchaStore.store[token] = CaptchaInfo{
		X:        x,
		CreateAt: time.Now(),
	}
	captchaStore.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"x":     x,
	})
}

// 验证请求结构体
type VerifyRequest struct {
	Token      string                  `json:"token" binding:"required"`
	OffsetX    int                   `json:"offsetX" binding:"required"`
	Trajectory []map[string]float64 `json:"trajectory" binding:"required"`
}

// POST /api/v1/verify - 验证
func VerifyCaptcha(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	captchaStore.mu.RLock()
	info, exists := captchaStore.store[req.Token]
	captchaStore.mu.RUnlock()

	if !exists {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证码不存在或已过期",
		})
		return
	}

	// 校验轨迹是否存在就删除，防止重放
	captchaStore.mu.Lock()
	delete(captchaStore.store, req.Token)
	captchaStore.mu.Unlock()

	// 检查误差
	if abs(req.OffsetX-info.X) > 5 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证失败，请重试",
		})
		return
	}

	// 检查轨迹
	if len(req.Trajectory) < 5 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "轨迹数据无效",
		})
		return
	}

	for _, point := range req.Trajectory {
		if _, ok := point["t"]; !ok {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "轨迹数据无效",
			})
			return
		}
		if _, ok := point["x"]; !ok {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "轨迹数据无效",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "验证成功",
	})
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}