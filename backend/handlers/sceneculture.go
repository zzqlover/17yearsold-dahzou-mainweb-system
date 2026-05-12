package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetScenicCulture(c *gin.Context) {
	spots := database.DB.GetSpots()

	var items []models.ScenicCultureItem
	for _, spot := range spots {
		items = append(items, models.ScenicCultureItem{
			ID:          spot.ID,
			Title:       spot.Title,
			Description: spot.Description,
			Location:    spot.Location,
			Image:       spot.Image,
		})
	}

	data := models.ScenicCultureData{
		HeroTitle:    "景色文化",
		HeroSubtitle: "山水画卷 · 人文达州",
		IntroTitle:   "自然与人文的交融",
		IntroDesc:    "达州山川秀美，湖泊如镜，古镇静谧。从莲花湖的荷花飘香到凤凰山的俯瞰全城，每一处都是自然的馈赠。",
		Items:        items,
	}

	c.JSON(http.StatusOK, data)
}

func CreateScenicCultureItem(c *gin.Context) {
	var item models.ScenicCultureItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var spot models.Spot
	spot.Title = item.Title
	spot.Description = item.Description
	spot.Location = item.Location
	spot.Image = item.Image

	if err := database.DB.CreateSpot(&spot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	item.ID = spot.ID
	c.JSON(http.StatusCreated, item)
}

func UpdateScenicCultureItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var item models.ScenicCultureItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var spot models.Spot
	spot.ID = uint(id)
	spot.Title = item.Title
	spot.Description = item.Description
	spot.Location = item.Location
	spot.Image = item.Image

	if err := database.DB.UpdateSpot(uint(id), &spot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func DeleteScenicCultureItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := database.DB.DeleteSpot(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
