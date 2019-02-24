/**
 * Naredbe za rad s WiFi:bitom.
 */
//% color=#2B5797 weight=90 icon="\uf1eb" block="WiFi:bit"
namespace WiFiBit {

    function writeToSerial(data: string, waitTime: number): void {
        serial.writeString(data + "\u000D" + "\u000A")
        if (waitTime > 0) {
            basic.pause(waitTime)
        }
    }

    /**
     * Serijski poveži micro:bit i WiFi:bit.
     */
    //% weight=100
    //% blockId="wfb_connect" block="poveži se s WiFi:bitom"
    export function connectToWiFiBit(): void {
        serial.redirect(
            SerialPin.P16,
            SerialPin.P8,
            BaudRate.BaudRate115200
        )
        basic.pause(10)
        // Restart module:
        writeToSerial("AT+RST", 2000)
        // Disable echo (Doesn’t send back received command):
        //writeToSerial("ATE0", 1000)
        // WIFI mode = Station mode (client):
        writeToSerial("AT+CWMODE=1", 5000)
    }

    /**
     * Spoji se na svoju WiFi mrežu.
     * @param ssid naziv WiFi mreže, eg: "SSID"
     * @param key lozinka WiFi mreže, eg: "ključ"
     */
    //% weight=99
    //% blockId="wfb_wifi_on" block="spoji se na WiFi mrežu (naziv: %ssid|, lozinka: %key|)"
    export function connectToWiFiNetwork(ssid: string, key: string): void {
        // Connect to AP:
        writeToSerial("AT+CWJAP=\"" + ssid + "\",\"" + key + "\"", 6000)
    }

    /**
     * Odspoji se s WiFi mreže.
     */
    //% weight=98
    //% blockId="wfb_wifi_off" block="odspoji se s WiFi mreže"
    export function disconnectFromWiFiNetwork(): void {
        // Disconnect from AP:
        writeToSerial("AT+CWQAP", 6000)
    }

    /**
     * Izvrši AT naredbu.
     * @param command AT naredba, eg: "AT"
     * @param waitTime pauza nakon naredbe, eg: 1000
     */
    //% weight=97
    //% blockId="wfb_at" block="izvrši AT naredbu %command| i zatim pričekaj %waitTime| ms"
    export function executeAtCommand(command: string, waitTime: number): void {
        writeToSerial(command, waitTime)
    }

    /**
     * Izvrši HTTP metodu GET.
     * @param host adresa servera, eg: "google.com"
     * @param port port servera, eg: 80
     * @param urlPath putanja na serveru, eg: "/search?q=something"
     */
    //% weight=96
    //% blockId="wfb_get" block="izvrši HTTP metodu GET (server: %host|, port: %port|, putanja: %urlPath|)"
    export function submitGetMethod(host: string, port: number, urlPath: string): void {
        // Establish TCP connection
        let data = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, 6000)
        data = "GET " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A" + "\u000D" + "\u000A"
        // Send data
        writeToSerial("AT+CIPSEND=" + (data.length + 2), 3000)
        writeToSerial(data, 6000)
        // CLose TCP connection
        writeToSerial("AT+CIPCLOSE", 3000)
    }

    /**
     * Izvrši HTTP metodu POST.
     * @param host adresa servera, eg: "google.com"
     * @param port port servera, eg: 80
     * @param urlPath putanja na serveru, eg: "/search"
     * @param headers zaglavlja, eg: []
     * @param body podaci, eg: "q=something"
     */
    //% weight=95
    //% blockId="wfb_post" block="izvrši HTTP metodu POST (server: %host|, port: %port|, putanja: %urlPath|, zaglavlja: %headers|, podaci: %body|)"
    export function submitPostMethod(host: string, port: number, urlPath: string, headers: string[] = [], body: string): void {
        // Establish TCP connection
        let data = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, 6000)
        data = "POST " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A"
        for (let i = 0; i < headers.length; i++) {
            data += headers[i] + "\u000D" + "\u000A"
        }
        data += "\u000D" + "\u000A"
        data += body + "\u000D" + "\u000A" + "\u000D" + "\u000A"
        // Send data
        writeToSerial("AT+CIPSEND=" + (data.length + 2), 3000)
        writeToSerial(data, 6000)
        // CLose TCP connection
        writeToSerial("AT+CIPCLOSE", 3000)
    }

}