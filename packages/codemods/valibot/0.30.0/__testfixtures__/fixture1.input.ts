import * as v from "valibot";
import { string, email, toCustom } from "valibot";
import { pipe } from "valibot";

const Schema1 = v.string([v.email()]);

const Schema2 = string("asd", [email()]);

const Schema3 = string("asd", "123", [email()]);

v.custom();
v.BaseSchema();
v.Input();
v.Output();
v.special();
toCustom();
toTrimmed();
v.toTrimmedEnd();
v.toTrimmedStart();

v.object({
  email: v.string([v.email(), v.endsWith("@gmail.com")]),
  password: v.string([v.minLength(8)]),
  other: v.union([v.string([v.decimal()]), v.number()]),
});

const ObjectSchema = v.object({ key: v.string() }, v.null_());
const TupleSchema = v.tuple([v.string()], v.null_());

const LooseObjectSchema = v.object({ key: v.string() }, v.unknown());
const LooseTupleSchema = v.tuple([v.string()], v.unknown());
const StrictObjectSchema = v.object({ key: v.string() }, v.never());
const StrictTupleSchema = v.tuple([v.string()], v.never());

const MergedObject = v.merge([ObjectSchema1, ObjectSchema2]);

const BrandedSchema = v.brand(v.string(), "foo");
const TransformedSchema = v.transform(v.string(), (input) => input.length);
