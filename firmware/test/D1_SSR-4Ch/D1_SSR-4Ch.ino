// =============================================
//  PRUEBA SSR 4 CANALES - WeMos D1 R1 (ESP8266)
//  Pines: D5, D7, D6, D0 (según nueva config.h)
//  CH2 movido de D4 a D7 para evitar conflicto LED_BUILTIN
//  CH4 añadido en D0 (GPIO16) para segundo humidificador
// =============================================

#define SSR1  14  // D5  (GPIO14) - Ventilación
#define SSR2  13  // D7  (GPIO13) - Calefacción (evita LED_BUILTIN en D4)
#define SSR3  12  // D6  (GPIO12) - Humidificación
#define SSR4  16  // D0  (GPIO16) - Iluminación (fototropismo)

void setup() {
  Serial.begin(115200);
  delay(500);
  
  Serial.println("\n=== Prueba SSR 4 Canales - WeMos D1 R1 ===");
  Serial.println("Pines usados: D5(SSR1), D7(SSR2), D6(SSR3), D0(SSR4)");
  Serial.println("CH2 movido de D4 a D7 para evitar conflicto con LED_BUILTIN");
  Serial.println("CH4 añadido en D0 (GPIO16) para segundo humidificador");

  pinMode(SSR1, OUTPUT);
  pinMode(SSR2, OUTPUT);
  pinMode(SSR3, OUTPUT);
  pinMode(SSR4, OUTPUT);

  // Apagar todos al inicio
  digitalWrite(SSR1, HIGH);
  digitalWrite(SSR2, HIGH);
  digitalWrite(SSR3, HIGH);
  digitalWrite(SSR4, HIGH);

  Serial.println("Todos los SSR apagados.");
  delay(1000);
}

void loop() {
  Serial.println("\n--- Iniciando ciclo de prueba ---");

  pruebaIndividual();
  pruebaTodosJuntos();

  delay(2500);
}

// ===================== FUNCIONES =====================

void pruebaIndividual() {
  int pines[] = {SSR1, SSR2, SSR3, SSR4};
  
  for(int i = 0; i < 4; i++) {
    Serial.print("Activando SSR ");
    Serial.print(i + 1);
    Serial.print(" (GPIO");
    Serial.print(pines[i]);
    Serial.println(")");
    
    digitalWrite(pines[i], LOW);    // Encender SSR
    delay(1500);
    digitalWrite(pines[i], HIGH);   // Apagar SSR
    delay(700);
  }
}

void pruebaTodosJuntos() {
  Serial.println("Activando TODOS los SSR (1, 2, 3, 4)...");
  
  digitalWrite(SSR1, LOW);
  digitalWrite(SSR2, LOW);
  digitalWrite(SSR3, LOW);
  digitalWrite(SSR4, LOW);
  
  delay(3500);
  
  digitalWrite(SSR1, HIGH);
  digitalWrite(SSR2, HIGH);
  digitalWrite(SSR3, HIGH);
  digitalWrite(SSR4, HIGH);
  
  Serial.println("Todos los SSR apagados.");
}