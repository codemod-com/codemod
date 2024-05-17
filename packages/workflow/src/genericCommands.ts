import { mapValues } from "lodash";
import { PLazy } from "./PLazy.js";
import { noContextFn } from "./helpers.js";
import type { MapChildren } from "./helpers.js";

export const constructMap =
  <
    KEY extends keyof CHILDREN,
    HELPERS extends MapChildren<CHILDREN>,
    CHILDREN extends {
      [k in KEY]: CHILDREN[KEY];
    },
  >(
    children: CHILDREN,
  ) =>
  (parentContext: (...args: any[]) => any = noContextFn) =>
  <
    CALLBACK extends (helpers: string) => ReturnType<CALLBACK>,
    RETURN extends ReturnType<CALLBACK>,
  >(
    callback: CALLBACK,
  ) => {
    const context = async (cb: any) => {
      const response = [] as RETURN[];
      await parentContext(async (...args: any[]) => {
        const result = await cb(...args);
        response.push(result);
        return result;
      });

      return response;
    };

    const promise = new PLazy<RETURN[]>((resolve, reject) => {
      context(callback).then(resolve).catch(reject);
    }) as PLazy<RETURN[]> & HELPERS;

    const helpers = mapValues(
      children,
      (value) =>
        (...args: any[]) =>
          value(context)(...args),
    );

    Object.keys(helpers).forEach((key) => {
      // @ts-ignore
      promise[key] = helpers[key];
    });

    return promise;
  };
