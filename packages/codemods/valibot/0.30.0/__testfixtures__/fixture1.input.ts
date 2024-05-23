import * as v from "valibot";
import { email, toCustom } from "valibot";
import { object, tuple, string, unknown, never } from "valibot";

const Schema1 = string([email()]);

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

const ObjectSchema = object({ key: v.string() }, v.null_());
const TupleSchema = tuple([v.string()], v.null_());

const LooseObjectSchema = object({ key: string() }, unknown());
const LooseTupleSchema = tuple([string()], unknown());
const StrictObjectSchema = object({ key: string() }, never());
const StrictTupleSchema = tuple([string()], never());

const MergedObject = v.merge([ObjectSchema1, ObjectSchema2]);

const BrandedSchema = v.brand(v.string(), "foo");
const TransformedSchema = v.transform(v.string(), (input) => input.length);
