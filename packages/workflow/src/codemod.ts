import { describeContext, migrateContext } from "./contexts";
import { logger } from "./helpers";

type Describe = { name: string; callback: () => void | Promise<void> };

type Migration = {
  name: string;
  callback: () => void;
  descriptions: Describe[];
};

const migrations: Migration[] = [];

export const describe = (
  description: string,
  callback: () => void | Promise<void>,
) => {
  if (!currentMigration) {
    throw new Error("describe() should be called inside migrate()");
  }
  // Clear screen
  // console.log('\x1b[2J');
  currentMigration.descriptions.push({ name: description, callback });
};

let currentMigration: Migration | undefined;

export function migrate(description: string, callback: () => void) {
  currentMigration = { name: description, callback, descriptions: [] };

  migrateContext.run({ name: description }, async () => {
    try {
      callback();
    } catch (e: any) {
      console.error(e);
      console.log(e.stack);
    }
  });

  migrations.push(currentMigration);
}

export const runMigrations = async () => {
  for (const migration of migrations) {
    for (const description of migration.descriptions) {
      const log = logger(`Running ${migration.name}/${description.name}`);
      try {
        await describeContext.run(
          { name: description.name },
          description.callback,
        );
        log.success();
      } catch (e: any) {
        log.fail(e.toString());
        log.fail(e.stack);
      }
    }
  }
};
