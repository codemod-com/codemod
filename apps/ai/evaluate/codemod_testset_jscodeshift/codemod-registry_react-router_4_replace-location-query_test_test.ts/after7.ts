import { parse } from 'query-string';

const SiteAuditLog = (props) => {
    const { page } = parse(props.location.search);

    return <ConnectedSiteAuditLog page={ page } {...props } />;
};