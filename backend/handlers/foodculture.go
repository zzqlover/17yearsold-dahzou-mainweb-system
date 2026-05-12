package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetFoodCulture(c *gin.Context) {
	items := database.DB.GetFoodCultureItems()

	data := models.FoodCultureData{
		HeroTitle:    "美食文化",
		HeroSubtitle: "舌尖上的达州 · 味蕾的盛宴",
		IntroTitle:   "独特的地域滋味",
		IntroDesc:    "达州美食融合了川菜的麻辣精髓与本地特色，形成了独树一帜的\"达州味道\"。从灯影牛肉的薄脆到包面的鲜香，每一道菜都承载着这片土地的记忆。",
		Items:        items,
	}

	c.JSON(http.StatusOK, data)
}

func CreateFoodItem(c *gin.Context) {
	var item models.FoodItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.CreateFoodItem(&item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

func UpdateFoodItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var item models.FoodItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.UpdateFoodItem(uint(id), &item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func DeleteFoodItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := database.DB.DeleteFoodItem(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
