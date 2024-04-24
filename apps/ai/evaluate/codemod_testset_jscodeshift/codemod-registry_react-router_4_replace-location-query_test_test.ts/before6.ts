function mapStateToProps(state: State, ownProps) {
    const { site, plan } = ownProps.location.query;

    return {
        siteId: site,
        highlightPlan: plan,
    };
}