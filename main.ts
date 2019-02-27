enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    CONNECT,
    TRACE
}


/**
 * Naredbe za rad s WiFi:bitom.
 */
//% color=#2B5797 weight=90 icon="\uf1eb" block="WiFi:bit"
namespace WiFiBit {

    let pauseBaseValue: number = 1000

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
     * @param ssid Naziv WiFi mreže, eg: "SSID"
     * @param key Lozinka WiFi mreže, eg: "ključ"
     */
    //% weight=99
    //% blockId="wfb_wifi_on" block="spoji se na WiFi mrežu %ssid, %key"
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
     * @param waitTime Pauza nakon naredbe, eg: 1000
     */
    //% weight=97
    //% blockId="wfb_at" block="izvrši AT naredbu %command i zatim pričekaj %waitTime ms"
    export function executeAtCommand(command: string, waitTime: number): void {
        writeToSerial(command, waitTime)
    }

    /**
     * Izvrši neku od HTTP metoda.
     * @param method metoda koja će se izvršiti, eg: HttpMethod.GET
     * @param host adresa servera, eg: "google.com"
     * @param port port servera, eg: 80
     * @param urlPath putanja na serveru, eg: "/search?q=something"
     * @param headers zaglavlja
     * @param body tijelo
     */
    //% weight=96
    //% blockId="wfb_http" block="izvrši HTTP metodu %method|server: %host|port: %port|putanja: %urlPath||zaglavlja: %headers|tijelo: %body"
    export function useHttpMethod(method: HttpMethod, host: string, port: number, urlPath: string, headers?: string, body?: string): void {
        let myMethod: string
        switch (method) {
            case HttpMethod.GET: myMethod = "GET"; break;
            case HttpMethod.POST: myMethod = "POST"; break;
            case HttpMethod.PUT: myMethod = "PUT"; break;
            case HttpMethod.HEAD: myMethod = "HEAD"; break;
            case HttpMethod.DELETE: myMethod = "DELETE"; break;
            case HttpMethod.PATCH: myMethod = "PATCH"; break;
            case HttpMethod.OPTIONS: myMethod = "OPTIONS"; break;
            case HttpMethod.CONNECT: myMethod = "CONNECT"; break;
            case HttpMethod.TRACE: myMethod = "TRACE";
        }
        // Establish TCP connection:
        let data = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, pauseBaseValue * 6)
        data = myMethod + " " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A"
        if (headers && headers.length > 0) {
            data += headers + "\u000D" + "\u000A"
        }
        if (data && data.length > 0) {
            data += "\u000D" + "\u000A" + body + "\u000D" + "\u000A"
        }
        data += "\u000D" + "\u000A"
        // Send data:
        writeToSerial("AT+CIPSEND=" + (data.length + 2), pauseBaseValue * 3)
        writeToSerial(data, pauseBaseValue * 6)
        // Close TCP connection:
        writeToSerial("AT+CIPCLOSE", pauseBaseValue * 3)
    }

    /**
     * Promijeni trajanje pauza u sklopu izvođenja HTTP metoda.
     * @param newPauseBaseValue Bazna vrijednost, eg: 1000
     */
    //% weight=95
    export function changeHttpMethodWaitPeriod(newPauseBaseValue: number): void {
        pauseBaseValue = newPauseBaseValue
    }

}


/**
 * Naredbe za rad s Blynkom.
 */
//% color=#2B5797 weight=89 icon="\uf1eb" block="Blynk"
namespace Blynk {

    /**
     * Zapiši vrijednost u pin Blynka.
     * @param auth_token Token, eg: "14dabda3551b4dd5ab46464af582f7d2"
     * @param pin Pin, eg: "A0"
     * @param value Vrijednost, eg: "510"
     */
    //% weight=100
    //% blockId="blynk_write" block="zapiši %value u %pin, token je %auth_token"
    export function writePinValue(value: string, pin: string, auth_token: string): void {
        WiFiBit.useHttpMethod(
            HttpMethod.GET,
            "blynk-cloud.com",
            80,
            "/" + auth_token + "/update/" + pin + "?value=" + value
        )
    }

    /**
     * Pročitaj vrijednost pina iz Blynka.
     * @param auth_token Token, eg: "14dabda3551b4dd5ab46464af582f7d2"
     * @param pin Pin, eg: "A0"
     */
    //% weight=99
    //% blockId="blynk_read" block="pročitaj %pin, token je %auth_token"
    export function readPinValue(pin: string, auth_token: string): void {
        WiFiBit.executeAtCommand("ATE0", 1000)
        let response: string
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            response += serial.readString()
        })
        WiFiBit.useHttpMethod(
            HttpMethod.GET,
            "blynk-cloud.com",
            80,
            "/" + auth_token + "/get/" + pin
        )
        basic.showString(response.substr(response.indexOf("[") + 2, response.indexOf("]") - response.indexOf("[") - 3))
        response = null
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => { })
    }

}