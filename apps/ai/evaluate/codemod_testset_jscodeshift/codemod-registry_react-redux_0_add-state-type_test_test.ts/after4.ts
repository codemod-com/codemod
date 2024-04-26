import { ThunkDispatch } from "redux-thunk";
import { State } from "state";

const mapDispatchToProps = (dispatch: ThunkDispatch<State, any, any>) => ({
    onA: (a) => dispatch(a),
});