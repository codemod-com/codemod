import { ThunkDispatch } from "redux-thunk";
import { State } from "state";

function mapDispatchToProps(dispatch: ThunkDispatch<State, any, any>) {
    return {
        onA: (a) => dispatch(a),
    }
};