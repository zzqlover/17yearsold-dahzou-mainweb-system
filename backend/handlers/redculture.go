package handlers

import (
	"lotus-lake-backend/database"
	"lotus-lake-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetRedCulture(c *gin.Context) {
	items := database.DB.GetRedCultureItems()

	data := models.RedCultureData{
		HeroTitle:   "红色文化",
		HeroSubtitle: "革命先烈 · 永垂不朽",
		IntroTitle:  "川陕革命根据地",
		IntroDesc:   "达州是川陕革命根据地的重要组成部分，红四方面军在这里建立了苏维埃政权，展开了艰苦卓绝的革命斗争。",
		Items:       items,
		Timeline: []models.TimelineItem{
			{Year: "1933", Title: "红四方面军入川", Desc: "红四方面军进入达州，建立川陕革命根据地"},
			{Year: "1934", Title: "万源保卫战", Desc: "红军在万源与敌军展开激烈战斗，保卫革命根据地"},
			{Year: "1949", Title: "达州解放", Desc: "人民解放军解放达州，结束国民党反动统治"},
		},
	}

	c.JSON(http.StatusOK, data)
}

func CreateRedCultureItem(c *gin.Context) {
	var item models.RedCultureItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.CreateRedCultureItem(&item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

func UpdateRedCultureItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var item models.RedCultureItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.UpdateRedCultureItem(uint(id), &item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func DeleteRedCultureItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := database.DB.DeleteRedCultureItem(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
