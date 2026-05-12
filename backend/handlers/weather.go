package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"math/rand"
	"strconv"
	"time"

	"lotus-lake-backend/config"

	"github.com/gin-gonic/gin"
)

type WeatherData struct {
	Temp       float64 `json:"temp"`
	Status     string  `json:"status"`
	Humidity   int     `json:"humidity"`
	WindSpeed  float64 `json:"windSpeed"`
	Visibility float64 `json:"visibility"`
	City       string  `json:"city"`
}

type QWeatherResponse struct {
	Code    string `json:"code"`
	Now struct {
		Temp      float64 `json:"temp"`
		FeelsLike float64 `json:"feelsLike"`
		Text      string  `json:"text"`
		WindDir   int     `json:"windDir"`
		WindScale string  `json:"windSpeed"`
		Humidity  int     `json:"humidty"`
		Vis       int     `json:"vis"`
	} `json:"now"`
}

func GetWeather(c *gin.Context) {
	city := c.DefaultQuery("city", "达州")
	cfg, _ := c.Get("config")
	configObj, _ := cfg.(*config.Config)
	var key string
	if configObj != nil {
		key = configObj.WeatherKey
	}

	if key != "" {
		data, err := fetchRealWeather(city, key)
		if err == nil && data != nil {
			c.JSON(http.StatusOK, gin.H{
				"code":    200,
				"message": "success",
				"source":  "qweather",
				"weather": data,
			})
			return
		}
	}

	data := generateDemoWeather(city)
	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "success",
		"source":  "demo",
		"weather": data,
	})
}

func fetchRealWeather(city, key string) (*WeatherData, error) {
	url := "https://devapi.qweather.com/v7/weather/now?location=" + city + "&key=" + key

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var qwr QWeatherResponse
	if json.Unmarshal(body, &qwr) != nil || qwr.Code != "200" {
		return nil, nil
	}

	ws, _ := strconv.ParseFloat(qwr.Now.WindScale, 32)
	vis := float64(qwr.Now.Vis)

	return &WeatherData{
		Temp:       qwr.Now.Temp,
		Status:     qwr.Now.Text,
		Humidity:   qwr.Now.Humidity,
		WindSpeed:  ws,
		Visibility: vis,
		City:       city,
	}, nil
}

func generateDemoWeather(city string) *WeatherData {
	rand.Seed(time.Now().UnixNano())

	weathers := []struct {
		temp      float64
		status    string
		humidity  int
		windSpeed float64
	}{
		{26, "晴", 65, 3},
		{23, "多云", 72, 5},
		{21, "小雨", 85, 8},
		{18, "雷阵雨", 92, 15},
		{28, "晴朗", 55, 2},
		{20, "阴天", 78, 6},
		{22, "太阳雨", 80, 7},
	}

	w := weathers[rand.Intn(len(weathers))]

	return &WeatherData{
		Temp:       w.temp + rand.Float64()*4 - 2,
		Status:     w.status,
		Humidity:   w.humidity + rand.Intn(10),
		WindSpeed:  w.windSpeed + rand.Float64()*3,
		Visibility: 8 + rand.Float64()*6,
		City:       city,
	}
}
