export class ConfigApplyCommand implements ICommand {
	constructor(private $serverConfigManager: IServerConfigManager,
		private $stringParameterBuilder: IStringParameterBuilder) { }

	public allowedParameters: ICommandParameter[] = [this.$stringParameterBuilder.createMandatoryParameter("You must specify path to configuration file.")];

	public async execute(args: string[]): Promise<void> {
		const configurationFile = args[0];
		this.$serverConfigManager.applyConfig(null, { configurationFile: configurationFile });
		this.$serverConfigManager.printConfigData();
	}
}

$injector.registerCommand("config|set", ConfigApplyCommand);
