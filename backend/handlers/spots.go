package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSpots(c *gin.Context) {
	spots := database.DB.GetSpots()
	c.JSON(http.StatusOK, gin.H{"data": spots})
}

func GetSpot(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	spot := database.DB.GetSpot(uint(id))
	if spot == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "景点未找到"})
		return
	}
	c.JSON(http.StatusOK, spot)
}

func CreateSpot(c *gin.Context) {
	var spot models.Spot
	if err := c.ShouldBindJSON(&spot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.CreateSpot(&spot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}
	c.JSON(http.StatusCreated, spot)
}

func UpdateSpot(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	var spot models.Spot
	if err := c.ShouldBindJSON(&spot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.UpdateSpot(uint(id), &spot); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "景点未找到"})
		return
	}
	c.JSON(http.StatusOK, spot)
}

func DeleteSpot(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}
	if err := database.DB.DeleteSpot(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "景点未找到"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetSpotCount(c *gin.Context) {
	spots := database.DB.GetSpots()
	c.JSON(http.StatusOK, gin.H{"count": len(spots)})
}

func GetSpotStats(c *gin.Context) {
	spots := database.DB.GetSpots()
	total := len(spots)
	if total > 5 {
		spots = spots[:5]
	}
	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"top_rated": spots,
	})
}
