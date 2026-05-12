package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	allNews := database.DB.GetNews()
	total := len(allNews)

	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	news := allNews[start:end]

	c.JSON(http.StatusOK, gin.H{
		"data":  news,
		"total": total,
		"page":  page,
	})
}

func GetNewsDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	news := database.DB.GetNewsDetail(uint(id))
	if news == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "新闻未找到"})
		return
	}
	c.JSON(http.StatusOK, news)
}

func CreateNews(c *gin.Context) {
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.CreateNews(&news); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}
	c.JSON(http.StatusCreated, news)
}

func UpdateNews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.UpdateNews(uint(id), &news); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "新闻未找到"})
		return
	}
	c.JSON(http.StatusOK, news)
}

func DeleteNews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	if err := database.DB.DeleteNews(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "新闻未找到"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
