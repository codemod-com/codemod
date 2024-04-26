const withPwa = (opts) => {
    // no-op but image this adds props
    return opts
}
module.exports = withPwa({
    images: {
        loader: "cloudinary",
        path: "https://example.com/",
    },
})