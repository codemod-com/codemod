use crate::rquickjs_compat;

pub async fn maybe_promise<'js>(
    result_obj: rquickjs_compat::Value<'js>,
) -> rquickjs_compat::Result<rquickjs_compat::Value<'js>> {
    let resolved_obj: rquickjs_compat::Value = if result_obj.is_promise() {
        let promise = result_obj.as_promise().unwrap().clone();
        let ctx = result_obj.ctx();
        while ctx.execute_pending_job() {}

        promise.into_future::<rquickjs_compat::Value<'js>>().await?
    } else {
        result_obj.clone()
    };
    Ok(resolved_obj)
}
