function mapStateToProps(state: State, ownProps) {
    const { search } = ownProps.location;
    const query = buildQuery(search);
    import { z } from 'zod';
    const querySchema = z.object({
        ticket: z.string(),
        response_type: z.string(),
        client_id: z.string(),
        redirect_uri: z.string(),
    })
    const parsedQuery = querySchema.parse(query);
    // @ts-expect-error TS(2339): Property 'config' does not exist on type 'State'.
    const { user, config } = state;
    const api = getApi({ user, config });
  
    return {
      api,
      ticket: parsedQuery.ticket,
      responseType: parsedQuery.response_type,
      clientID: parsedQuery.client_id,
      redirectURI: parsedQuery.redirect_uri,
      scope: parsedQuery.scope,
      state: parsedQuery.state,
      user: selectCurrentUser(state),
      accounts: selectAccounts(state),
      organizations: selectOrganizations(state),
    };
  }
  