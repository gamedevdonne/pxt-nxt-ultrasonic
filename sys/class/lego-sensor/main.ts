// % color="#006A4E" weight=100 icon="\uf06e" block="NXT Sensors"
namespace nxtSensors {

    /**
     * Reads the distance in centimeters from an NXT Ultrasonic Sensor.
     * @param port The sensor input port (1-4)
     */
    // % block="nxt ultrasonic distance cm on %port"
    // % port.defl=SensorPort.In4
    export function nxtUltrasonicDistance(port: SensorPort): number {
        // Find the device driver index assigned by ev3dev for this port
        let portName = "in" + (port + 1); // Ports are 0-indexed in code, 1-4 physically
        let sensorPath = getSensorPathByPort(portName);

        if (sensorPath == "") {
            return 255; // Standard LEGO error state value meaning "no sensor/out of range"
        }

        // Force the sensor mode to distance if not already set (US-DIST-CM)
        pins.sysWriteString(sensorPath + "/mode", "US-DIST-CM");

        // Read the value0 file which holds the live distance calculation
        let rawValue = pins.sysReadString(sensorPath + "/value0");
        let distance = parseInt(rawValue);

        return isNaN(distance) ? 255 : distance;
    }

    // Helper function to scan ev3dev system directories for the NXT Ultrasonic driver
    function getSensorPathByPort(portName: string): string {
        // ev3dev populates sensors dynamically. We look for lego-nxt-us on our target port.
        for (let i = 0; i < 10; i++) {
            let base = "/sys/class/lego-sensor/sensor" + i;
            if (pins.sysFileExists(base + "/address")) {
                let address = pins.sysReadString(base + "/address").trim();
                let driver = pins.sysReadString(base + "/driver_name").trim();
                
                // Matches if the address is ev3-ports:inX and the driver is the legacy NXT US driver
                if (address.indexOf(portName) >= 0 && driver == "lego-nxt-us") {
                    return base;
                }
            }
        }
        return "";
    }
}
