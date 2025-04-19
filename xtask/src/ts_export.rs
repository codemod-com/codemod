use std::{any::TypeId, collections::HashMap};

use ts_rs::{TypeVisitor, TS};

struct Visit<'a> {
    type_hash_map: &'a mut HashMap<TypeId, String>,
}

impl<'a> TypeVisitor for Visit<'a> {
    fn visit<T: TS + 'static + ?Sized>(&mut self) {
        if T::output_path().is_none() {
            return;
        }

        let type_id = TypeId::of::<T>();
        if let std::collections::hash_map::Entry::Vacant(e) = self.type_hash_map.entry(type_id) {
            e.insert(T::decl());

            export_recursive::<T>(self.type_hash_map);
        }
    }
}

pub fn export_recursive<T: TS + 'static + ?Sized>(type_hash_map: &mut HashMap<TypeId, String>) {
    type_hash_map
        .entry(TypeId::of::<T>())
        .or_insert_with(|| T::decl());

    let mut visitor = Visit { type_hash_map };

    T::visit_dependencies(&mut visitor);
}
