const SiteAuditLog = (props) => {
    const { page } = props.location.query;

    return <ConnectedSiteAuditLog page={ page } {...props } />;
};