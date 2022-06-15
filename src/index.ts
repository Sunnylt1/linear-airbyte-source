import axios from "axios";
import { Command } from "commander";
import {
  AirbyteConfig,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteStreamBase,
  Spec,
} from "faros-airbyte-cdk";
import VError from "verror";

import { Team, Issue, Organization } from "./streams";

/** The main entry point. */
export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new ExampleSource(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const spec: Spec = require("../resources/spec.json");

/** Example source implementation. */
class ExampleSource extends AirbyteSourceBase {
  public async spec(): Promise<AirbyteSpec> {
    return new AirbyteSpec(spec);
  }
  public async checkConnection(config: AirbyteConfig): Promise<[boolean, VError]> {
    try {
      await axios.get<unknown[]>("https://24454957ce48.ngrok.io/export/organization", {
        headers: { Authorization: config.token },
      });
      return [true, null];
    } catch (err) {
      return [false, new VError(err)];
    }
  }
  public streams(config: AirbyteConfig): AirbyteStreamBase[] {
    return [new Team(this.logger, config), new Organization(this.logger, config), new Issue(this.logger, config)];
  }
}
