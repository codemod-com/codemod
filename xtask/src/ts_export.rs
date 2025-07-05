use regex::Regex;
use std::{
    any::TypeId,
    collections::{HashMap, HashSet},
};

use ts_rs::{TypeVisitor, TS};

struct Visit<'a> {
    type_hash_map: &'a mut HashMap<TypeId, String>,
    type_names: &'a mut HashSet<String>,
}

impl TypeVisitor for Visit<'_> {
    fn visit<T: TS + 'static + ?Sized>(&mut self) {
        if T::output_path().is_none() {
            return;
        }
        if self.type_names.contains(&T::name()) {
            return;
        }

        let type_id = TypeId::of::<T>();
        if let std::collections::hash_map::Entry::Vacant(e) = self.type_hash_map.entry(type_id) {
            e.insert("export ".to_string() + &replace_object_with_record(&T::decl()));
            self.type_names.insert(T::name());
            export_recursive::<T>(self.type_hash_map, self.type_names);
        }
    }
}

pub fn export_recursive<T: TS + 'static + ?Sized>(
    type_hash_map: &mut HashMap<TypeId, String>,
    type_names: &mut HashSet<String>,
) {
    type_hash_map
        .entry(TypeId::of::<T>())
        .or_insert_with(|| "export ".to_string() + &replace_object_with_record(&T::decl()));
    type_names.insert(T::name());

    let mut visitor = Visit {
        type_hash_map,
        type_names,
    };

    T::visit_dependencies(&mut visitor);
}

fn replace_object_with_record(string: &str) -> String {
    let re = Regex::new(r"\{\s*\[key in (\w+)\]\?:\s*(\w+)\s*}").unwrap();
    re.replace(string, "Record<$1, $2>").to_string()
}
