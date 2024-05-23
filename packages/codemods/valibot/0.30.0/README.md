# valibot/0.30.0

## Description
Updates valibot from 0.30.0 to 0.31.0

## Examples

### Before

```ts
import * as v from "valibot";
import { email } from "valibot";

const Schema1 = v.string([email()]);

const Schema2 = v.string("asd", [email()]);

const Schema3 = v.string("asd", "123", [email()]);
```

### After

```ts
import * as v from "valibot";
import { email } from "valibot";

const Schema1 = v.pipe(v.string(), email());

const Schema2 = v.pipe(v.string("asd"), email());

const Schema3 = v.pipe(v.string("asd", "123"), email());
```

### Before

```ts
import * as v from "valibot";
import { toCustom } from "valibot";

v.custom();
v.BaseSchema();
v.Input();
v.Output();
v.special();
toCustom();
toTrimmed();
v.toTrimmedEnd();
v.toTrimmedStart();
```

### After

```ts
import * as v from "valibot";
import { transform } from "valibot";

v.check();
v.GenericSchema();
v.InferInput();
v.InferOutput();
v.custom();
transform();
toTrimmed();
v.trimEnd();
v.trimStart();
```

### Before

```ts
import * as v from "valibot";

v.object({
  email: v.string([v.email(), v.endsWith("@gmail.com")]),
  password: v.string([v.minLength(8)]),
  other: v.union([v.string([v.decimal()]), v.number()]),
});
```

### After

```ts
import * as v from "valibot";

v.object({
  email: v.pipe(v.string(), v.email(), v.endsWith("@gmail.com")),
  password: v.pipe(v.string(), v.minLength(8)),
  other: v.union([v.pipe(v.string(), v.decimal()), v.number()]),
});
```

### Before

```ts
import * as v from "valibot";
import { object, tuple } from "valibot";

const ObjectSchema = object({ key: v.string() }, v.null_());
const TupleSchema = tuple([v.string()], v.null_());
```

### After

```ts
import * as v from "valibot";
import { tupleWithRest, objectWithRest } from "valibot";

const ObjectSchema = objectWithRest({ key: v.string() }, v.null_());
const TupleSchema = tupleWithRest([v.string()], v.null_());
```

### Before

```ts
import { object, tuple, string, unknown, never } from "valibot";

const LooseObjectSchema = object({ key: string() }, unknown());
const LooseTupleSchema = tuple([string()], unknown());
const StrictObjectSchema = object({ key: string() }, never());
const StrictTupleSchema = tuple([string()], never());
```

### After

```ts
import {
  string,
  strictTuple,
  strictObject,
  looseTuple,
  looseObject,
} from "valibot";

const LooseObjectSchema = looseObject({ key: string() });
const LooseTupleSchema = looseTuple([string()]);
const StrictObjectSchema = strictObject({ key: string() });
const StrictTupleSchema = strictTuple([string()]);
```

### Before

```ts
import * as v from "valibot";

const ObjectSchema1 = v.object({ foo: v.string() });
const ObjectSchema2 = v.object({ bar: v.number() });

const MergedObject = v.merge([ObjectSchema1, ObjectSchema2]);
```

### After

```ts
import * as v from "valibot";

const ObjectSchema1 = v.object({ foo: v.string() });
const ObjectSchema2 = v.object({ bar: v.number() });

const MergedObject = v.object({
  ...ObjectSchema1.entries,
  ...ObjectSchema2.entries,
});
```

### Before

```ts
import * as v from "valibot";

const BrandedSchema = v.brand(v.string(), "foo");
const TransformedSchema = v.transform(v.string(), (input) => input.length);
```

### After

```ts
import * as v from "valibot";

const BrandedSchema = v.pipe(v.string(), v.brand("foo"));
const TransformedSchema = v.pipe(
  v.string(),
  v.transform((input) => input.length),
);
```
