This codemod addresses changes mentioned in [Prisma's official upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-5/jsonprotocol-changes) related to Json Protocol changes.

## Note:

There are known FNs for this codemod when in any occassion you pass an identifier (variable) that is not an array into prisma client invocations where it expects an array. This is due to the fact that the codemod is not able to infer the type of the identifier. In such cases, you will have to manually update the code. The codemod will still work for most of the cases when such calls are made with literals.