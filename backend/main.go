package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"lotus-lake-backend/config"
	"lotus-lake-backend/database"
	"lotus-lake-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	workDir, _ := os.Getwd()
	execPath, _ := os.Executable()
	execDir := filepath.Dir(execPath)

	if execPath == "" || filepath.Ext(execPath) == ".go" || execDir == "" || execDir == "." {
		workDir, _ = os.Getwd()
	} else {
		workDir = execDir
	}

	if envRoot := os.Getenv("APP_ROOT"); envRoot != "" {
		workDir = envRoot
	}

	envFile := filepath.Join(workDir, ".env")
	if data, err := os.ReadFile(envFile); err == nil {
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			if idx := strings.Index(line, "="); idx > 0 {
				key := strings.TrimSpace(line[:idx])
				value := strings.TrimSpace(line[idx+1:])
				if os.Getenv(key) == "" {
					os.Setenv(key, value)
				}
			}
		}
	}

	cfg := config.Load()

	if err := database.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Use(func(c *gin.Context) {
		c.Set("config", cfg)
	})

	r.Static("/uploads", cfg.Uploads)

	api := r.Group("/api/v1")
	{
		api.GET("/home", handlers.GetHomeData)

		api.GET("/spots", handlers.GetSpots)
		api.GET("/spots/:id", handlers.GetSpot)
		api.GET("/spots/count", handlers.GetSpotCount)
		api.GET("/spots/stats", handlers.GetSpotStats)

		api.GET("/news", handlers.GetNews)
		api.GET("/news/:id", handlers.GetNewsDetail)

		api.GET("/slides", handlers.GetSlides)
		api.GET("/slides/all", handlers.GetAllSlides)
		api.GET("/slides/count", handlers.GetSlideCount)

		api.GET("/culture/red", handlers.GetRedCulture)
		api.GET("/culture/scenic", handlers.GetScenicCulture)
		api.GET("/culture/food", handlers.GetFoodCulture)

		api.POST("/chat", handlers.ChatWithAssistant)

		api.GET("/weather", handlers.GetWeather)

		// 滑动验证码
		api.GET("/captcha", handlers.GetCaptcha)
		api.POST("/verify", handlers.VerifyCaptcha)

		// 安全密钥验证（带IP记录）
		api.POST("/security/verify", handlers.VerifySecurityKey)
		api.GET("/security/ip-records", handlers.GetIPRecords)
		api.POST("/security/block", handlers.BlockIP)
		api.POST("/security/unblock", handlers.UnblockIP)
		api.POST("/security/ip/delete", handlers.DeleteIP)
		api.POST("/security/ips/clear", handlers.ClearAllIPs)
		api.POST("/security/batch-block", handlers.BatchBlockIPs)
		api.POST("/security/block-all", handlers.BlockAllIPs)

		admin := api.Group("/admin")
		{
			admin.POST("/login", handlers.AdminLogin)
			admin.POST("/logout", handlers.AdminLogout)
			admin.GET("/info", handlers.GetAdminInfo)

			admin.POST("/spots", handlers.CreateSpot)
			admin.PUT("/spots/:id", handlers.UpdateSpot)
			admin.DELETE("/spots/:id", handlers.DeleteSpot)

			admin.POST("/news", handlers.CreateNews)
			admin.PUT("/news/:id", handlers.UpdateNews)
			admin.DELETE("/news/:id", handlers.DeleteNews)

			admin.POST("/slides", handlers.CreateSlide)
			admin.PUT("/slides/:id", handlers.UpdateSlide)
			admin.DELETE("/slides/:id", handlers.DeleteSlide)

			admin.POST("/culture/red", handlers.CreateRedCultureItem)
			admin.PUT("/culture/red/:id", handlers.UpdateRedCultureItem)
			admin.DELETE("/culture/red/:id", handlers.DeleteRedCultureItem)

			admin.POST("/culture/scenic", handlers.CreateScenicCultureItem)
			admin.PUT("/culture/scenic/:id", handlers.UpdateScenicCultureItem)
			admin.DELETE("/culture/scenic/:id", handlers.DeleteScenicCultureItem)

			admin.POST("/culture/food", handlers.CreateFoodItem)
			admin.PUT("/culture/food/:id", handlers.UpdateFoodItem)
			admin.DELETE("/culture/food/:id", handlers.DeleteFoodItem)
		}
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "达州文化管理系统 API"})
	})

	port := cfg.Port
	if port == "" {
		port = "5000"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
		os.Exit(1)
	}
}
