package handlers

import (
	"lotus-lake-backend/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetHomeData(c *gin.Context) {
	slides := database.DB.GetSlides()
	spots := database.DB.GetSpots()

	if len(spots) > 4 {
		spots = spots[:4]
	}

	c.JSON(http.StatusOK, gin.H{
		"slides": slides,
		"spots":  spots,
	})
}
