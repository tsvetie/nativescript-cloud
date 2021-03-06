import { EventEmitter } from "events";
import { DEVICE_DISCOVERY_EVENTS } from "../../constants";
import { AppetizeDevice } from "../device/appetize-device";

export class AppetizeDeviceDiscovery extends EventEmitter implements Mobile.IDeviceDiscovery {
	private devices: IDictionary<Mobile.IDevice> = {};
	private _hasStartedLookingForDevices = false;

	constructor(private $cloudDeviceEmulator: ICloudDeviceEmulator,
		private $injector: IInjector) {
		super();
	}

	public addDevice(device: Mobile.IDevice) {
		this.devices[device.deviceInfo.identifier] = device;
		this.raiseOnDeviceFound(device);
	}

	public removeDevice(deviceIdentifier: string) {
		let device = this.devices[deviceIdentifier];
		if (!device) {
			return;
		}

		delete this.devices[deviceIdentifier];
		this.raiseOnDeviceLost(device);
	}

	public async startLookingForDevices(): Promise<void> {
		if (!this._hasStartedLookingForDevices) {
			this._hasStartedLookingForDevices = true;
			_.values(this.$cloudDeviceEmulator.deviceEmitter.getCurrentlyAttachedDevices()).forEach(basicInfo => {
				this.addAppetizeDevice(basicInfo);
			});

			this.$cloudDeviceEmulator.deviceEmitter.on(DEVICE_DISCOVERY_EVENTS.DEVICE_FOUND, (basicInfo: IAppetizeDeviceBasicInfo) => {
				this.addAppetizeDevice(basicInfo);
			});

			this.$cloudDeviceEmulator.deviceEmitter.on(DEVICE_DISCOVERY_EVENTS.DEVICE_LOST, (basicInfo: IAppetizeDeviceBasicInfo) => {
				this.removeDevice(basicInfo.identifier);
			});
		}
	}

	public async checkForDevices(): Promise<void> { /* currently empty */ }

	private raiseOnDeviceFound(device: Mobile.IDevice) {
		this.emit(DEVICE_DISCOVERY_EVENTS.DEVICE_FOUND, device);
	}

	private raiseOnDeviceLost(device: Mobile.IDevice) {
		this.emit(DEVICE_DISCOVERY_EVENTS.DEVICE_LOST, device);
	}

	private addAppetizeDevice(basicInfo: IAppetizeDeviceBasicInfo) {
		const device: Mobile.IDevice = this.$injector.resolve(AppetizeDevice, { basicInfo: basicInfo });
		this.addDevice(device);
	}
}

$injector.register("appetizeDeviceDiscovery", AppetizeDeviceDiscovery);
