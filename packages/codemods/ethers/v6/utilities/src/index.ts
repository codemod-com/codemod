export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace ethers.utils.formatBytes32String with ethers.encodeBytes32String
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "formatBytes32String" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("encodeBytes32String"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.parseBytes32String with ethers.decodeBytes32String
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "parseBytes32String" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("decodeBytes32String"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.constants.AddressZero with ethers.ZeroAddress
  root
    .find(j.MemberExpression, {
      object: { object: { name: "ethers" }, property: { name: "constants" } },
      property: { name: "AddressZero" },
    })
    .forEach((path) => {
      path.node.object = j.identifier("ethers");
      path.node.property = j.identifier("ZeroAddress");
      dirtyFlag = true;
    });

  // Replace ethers.constants.HashZero with ethers.ZeroHash
  root
    .find(j.MemberExpression, {
      object: { object: { name: "ethers" }, property: { name: "constants" } },
      property: { name: "HashZero" },
    })
    .forEach((path) => {
      path.node.object = j.identifier("ethers");
      path.node.property = j.identifier("ZeroHash");
      dirtyFlag = true;
    });

  // Replace ethers.utils.hexDataSlice with ethers.dataSlice
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "hexDataSlice" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("dataSlice"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.hexZeroPad with ethers.zeroPadValue
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "hexZeroPad" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("zeroPadValue"),
      );
      dirtyFlag = true;
    });

  // Replace hexlify with toBeHex
  root
    .find(j.CallExpression, {
      callee: { name: "hexlify" },
    })
    .forEach((path) => {
      path.node.callee = j.identifier("toBeHex");
      dirtyFlag = true;
    });

  // Replace AbiCoder.defaultAbiCoder with AbiCoder.defaultAbiCoder()
  root
    .find(j.MemberExpression, {
      object: { name: "AbiCoder" },
      property: { name: "defaultAbiCoder" },
    })
    .forEach((path) => {
      path.replace(
        j.callExpression(
          j.memberExpression(
            j.identifier("AbiCoder"),
            j.identifier("defaultAbiCoder"),
          ),
          [],
        ),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.hexValue with ethers.toQuantity
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "hexValue" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("toQuantity"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.arrayify with ethers.getBytes
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "arrayify" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("getBytes"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.solidityPack with ethers.solidityPacked
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "solidityPack" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("solidityPacked"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.solidityKeccak256 with ethers.solidityPackedKeccak256
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "solidityKeccak256" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("solidityPackedKeccak256"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.soliditySha256 with ethers.solidityPackedSha256
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "soliditySha256" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("solidityPackedSha256"),
      );
      dirtyFlag = true;
    });

  // Replace ethers.utils.defineReadOnly with ethers.defineProperties
  root
    .find(j.CallExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "utils" } },
        property: { name: "defineReadOnly" },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 3) {
        const obj = args[0];
        const key = args[1];
        const value = args[2];
        path.replace(
          j.callExpression(
            j.memberExpression(
              j.identifier("ethers"),
              j.identifier("defineProperties"),
            ),
            [
              obj,
              j.objectExpression([
                j.property.from({
                  kind: "init",
                  key: j.identifier(key.value),
                  value,
                }),
              ]),
            ],
          ),
        );
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
