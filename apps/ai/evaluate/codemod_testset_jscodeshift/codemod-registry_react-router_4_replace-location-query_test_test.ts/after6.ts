import { parse } from 'query-string';

function mapStateToProps(state: State, ownProps) {
    const { site, plan } = parse(ownProps.location.search);

    return {
        siteId: site,
        highlightPlan: plan,
    };
}