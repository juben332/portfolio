#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// ─── WiFi Credentials ───────────────────────────────
#define WIFI_SSID "Piso WiFi"
#define WIFI_PASSWORD "ambotnimo123"

// ─── Firebase Project Credentials ───────────────────
#define API_KEY "AIzaSyDlaFU34iAAo4ceymNckVbLLkuFkFVXiFA"
#define DATABASE_URL "https://durian-app-2cdce-default-rtdb.firebaseio.com/"

// ─── DHT22 Setup ────────────────────────────────────
#define DHTPIN D4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ─── Relay Setup ────────────────────────────────────
#define RELAY_MIST D1   // Relay for misting
#define RELAY_FAN  D2   // Relay for fan
#define RELAY_PUMP D5   // Relay for water pump (NEW)

// ─── Soil Moisture Setup ────────────────────────────
#define SOIL_MOISTURE_PIN A0  // Analog pin for soil sensor

// ─── Firebase Objects ──────────────────────────────
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected!");

  // Firebase setup
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous sign-in
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✅ Firebase signUp successful");
  } else {
    Serial.printf("❌ Firebase signUp failed: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // DHT & Relay init
  dht.begin();
  pinMode(RELAY_MIST, OUTPUT);
  pinMode(RELAY_FAN, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);  // Initialize pump relay
  
  digitalWrite(RELAY_MIST, HIGH);  // off initially (active LOW)
  digitalWrite(RELAY_FAN, HIGH);
  digitalWrite(RELAY_PUMP, HIGH);  // off initially (active LOW)

  Serial.println("✅ System ready!");
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int soilValue = analogRead(SOIL_MOISTURE_PIN); // 0–1023
  int soilPercent = map(soilValue, 1023, 0, 0, 100); // convert to %

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  Serial.printf("🌡 Temp: %.2f °C  💧 Humidity: %.2f %%  🌱 Soil: %d (%d%%)\n",
                temperature, humidity, soilValue, soilPercent);

  // ---- Push sensor data to Firebase ----
  if (Firebase.RTDB.setFloat(&fbdo, "humidity", humidity)) {
    Serial.println("✅ Humidity updated in Firebase");
  } else {
    Serial.println("❌ Failed to update humidity: " + fbdo.errorReason());
  }

  if (Firebase.RTDB.setFloat(&fbdo, "temperature", temperature)) {
    Serial.println("✅ Temperature updated in Firebase");
  } else {
    Serial.println("❌ Failed to update temperature: " + fbdo.errorReason());
  }

  if (Firebase.RTDB.setInt(&fbdo, "soilMoisture", soilValue)) {
    Serial.println("✅ Soil moisture updated in Firebase");
  } else {
    Serial.println("❌ Failed to update soil moisture: " + fbdo.errorReason());
  }

  // ---- Read relay controls from Firebase ----
  if (Firebase.RTDB.getBool(&fbdo, "misting")) {
    bool mistState = fbdo.boolData();
    digitalWrite(RELAY_MIST, mistState ? LOW : HIGH);  // active LOW
    Serial.printf("Misting: %s\n", mistState ? "ON" : "OFF");
  } else {
    Serial.println("⚠️ Failed to read misting: " + fbdo.errorReason());
  }

  if (Firebase.RTDB.getBool(&fbdo, "fan")) {
    bool fanState = fbdo.boolData();
    digitalWrite(RELAY_FAN, fanState ? LOW : HIGH);  // active LOW
    Serial.printf("Fan: %s\n", fanState ? "ON" : "OFF");
  } else {
    Serial.println("⚠️ Failed to read fan: " + fbdo.errorReason());
  }

  // ---- Read water pump control from Firebase (NEW) ----
  if (Firebase.RTDB.getBool(&fbdo, "waterPump")) {
    bool pumpState = fbdo.boolData();
    digitalWrite(RELAY_PUMP, pumpState ? LOW : HIGH);  // active LOW
    Serial.printf("💦 Water Pump: %s\n", pumpState ? "ON" : "OFF");
  } else {
    Serial.println("⚠️ Failed to read water pump: " + fbdo.errorReason());
  }

  delay(5000); // update every 5s
}