package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSlides(c *gin.Context) {
	slides := database.DB.GetSlides()
	var activeSlides []models.Slide
	for _, s := range slides {
		if s.IsActive {
			activeSlides = append(activeSlides, s)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": activeSlides})
}

func GetAllSlides(c *gin.Context) {
	slides := database.DB.GetSlides()
	c.JSON(http.StatusOK, gin.H{"data": slides})
}

func CreateSlide(c *gin.Context) {
	var slide models.Slide
	if err := c.ShouldBindJSON(&slide); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.CreateSlide(&slide); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}
	c.JSON(http.StatusCreated, slide)
}

func UpdateSlide(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	var slide models.Slide
	if err := c.ShouldBindJSON(&slide); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.UpdateSlide(uint(id), &slide); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "轮播图未找到"})
		return
	}
	c.JSON(http.StatusOK, slide)
}

func DeleteSlide(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	if err := database.DB.DeleteSlide(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "轮播图未找到"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetSlideCount(c *gin.Context) {
	slides := database.DB.GetSlides()
	c.JSON(http.StatusOK, gin.H{"count": len(slides)})
}
