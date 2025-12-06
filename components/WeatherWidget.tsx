"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Droplets, Thermometer, Wind, CloudRain } from "lucide-react";
import { LUNA_CENTER } from "@/lib/luna-barangays";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  condition: string;
  chanceOfRain: number;
}

// Luna, La Union coordinates - using same coordinates as geo map
const LUNA_LOCATION = `${LUNA_CENTER[0]},${LUNA_CENTER[1]}`; // WeatherAPI.com accepts lat,lon format

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // WeatherAPI.com - Current weather with forecast for chance of rain
        // Get API key from environment variable or use a default (you should set this in .env.local)
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

        if (!apiKey) {
          throw new Error("Weather API key not configured");
        }

        // Get current weather and forecast for chance of rain
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${LUNA_LOCATION}&days=1&aqi=no&alerts=no`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || "Failed to fetch weather data"
          );
        }

        const data = await response.json();
        const current = data.current;
        const forecastDay = data.forecast?.forecastday?.[0];
        const location = data.location;

        // Log for debugging - verify location
        console.log(
          "[WeatherWidget] Location:",
          location?.name,
          location?.region,
          location?.country
        );
        console.log(
          "[WeatherWidget] Coordinates:",
          location?.lat,
          location?.lon
        );
        console.log("[WeatherWidget] API localtime:", location?.localtime);

        // Get current hour's chance_of_rain from hourly forecast
        // Use the API's local time to find the correct hour (important for timezone)
        const apiLocalTime = location?.localtime
          ? new Date(location.localtime)
          : new Date();
        const currentHour = apiLocalTime.getHours();

        // Find the hour that matches current local time
        const currentHourForecast = forecastDay?.hour?.find((h: any) => {
          const hourTime = new Date(h.time);
          return hourTime.getHours() === currentHour;
        });

        console.log("[WeatherWidget] Current hour (local):", currentHour);
        console.log(
          "[WeatherWidget] Found hour forecast:",
          currentHourForecast?.time,
          "chance_of_rain:",
          currentHourForecast?.chance_of_rain
        );
        console.log(
          "[WeatherWidget] Daily chance_of_rain:",
          forecastDay?.day?.daily_chance_of_rain
        );

        setWeather({
          temperature: Math.round(current.temp_c),
          humidity: current.humidity,
          windSpeed: Math.round(current.wind_kph),
          description: current.condition.text,
          condition: current.condition.text,
          chanceOfRain: currentHourForecast?.chance_of_rain ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load weather data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4 animate-pulse" />
            <span>Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            {error || "Weather unavailable"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">
                Luna, La Union
              </div>
              <div className="text-sm font-medium">{weather.description}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Temperature</div>
              <div className="text-sm font-medium">{weather.temperature}°C</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-sm font-medium">{weather.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Wind Speed</div>
              <div className="text-sm font-medium">
                {weather.windSpeed} km/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">
                Chance of Rain
              </div>
              <div className="text-sm font-medium">{weather.chanceOfRain}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
