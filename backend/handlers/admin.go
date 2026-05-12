package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func AdminLogin(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请提供用户名和密码"})
		return
	}

	admins := database.DB.Admins
	if len(admins) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	var admin models.Admin
	var found bool
	for _, a := range admins {
		if a.Username == input.Username {
			admin = a
			found = true
			break
		}
	}

	if !found {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	token := admin.Username + "-token-" + time.Now().Format("20060102150405")

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": admin.Username,
	})
}

func AdminLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "退出成功"})
}

func GetAdminInfo(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"username": "admin",
	})
}
