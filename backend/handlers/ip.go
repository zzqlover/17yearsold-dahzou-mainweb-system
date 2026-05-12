package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"lotus-lake-backend/database"

	"github.com/gin-gonic/gin"
)

type VerifyKeyRequest struct {
	Key string `json:"key" binding:"required"`
}

func VerifySecurityKey(c *gin.Context) {
	clientIP := c.ClientIP()

	record := database.DB.GetIPRecord(clientIP)
	if record != nil && record.Blocked {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "blocked",
			"message": "您的IP已被锁定，请联系管理员处理",
		})
		return
	}

	var req VerifyKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	req.Key = strings.TrimSpace(req.Key)

	const CORRECT_KEY = "5201314"

	if req.Key != CORRECT_KEY {
		fmt.Printf("SecurityKey: received=%q expected=%q\n", req.Key, CORRECT_KEY)
		failCount, _ := database.DB.RecordIPFail(clientIP)

		if failCount >= 5 {
			c.JSON(http.StatusForbidden, gin.H{
				"error":     "too_many_attempts",
				"failCount": failCount,
				"message":   "验证失败次数过多，您的IP已被记录，请联系管理员13558526791",
			})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":     "invalid_key",
				"failCount": failCount,
				"message":   "安全密钥错误",
			})
		}
		return
	}

	database.DB.ResetIPFail(clientIP)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "验证成功",
	})
}

func GetIPRecords(c *gin.Context) {
	records := database.DB.GetAllIPRecords()
	c.JSON(http.StatusOK, gin.H{"records": records})
}

func BlockIP(c *gin.Context) {
	var req struct {
		IP string `json:"ip" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	database.DB.BlockIP(req.IP)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func UnblockIP(c *gin.Context) {
	var req struct {
		IP string `json:"ip" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	database.DB.UnblockIP(req.IP)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func DeleteIP(c *gin.Context) {
	var req struct {
		IP string `json:"ip" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	database.DB.DeleteIP(req.IP)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func ClearAllIPs(c *gin.Context) {
	database.DB.ClearAllIPs()
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func BatchBlockIPs(c *gin.Context) {
	var req struct {
		IPs []string `json:"ips" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	database.DB.BatchBlockIPs(req.IPs)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func BlockAllIPs(c *gin.Context) {
	database.DB.BlockAllIPs()
	c.JSON(http.StatusOK, gin.H{"success": true})
}
