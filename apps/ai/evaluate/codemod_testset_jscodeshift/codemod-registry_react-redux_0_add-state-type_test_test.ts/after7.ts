import { ThunkDispatch } from "redux-thunk";
import { State } from "state";

const mapStateToProps = (state: State) => {
    return {
        ...state
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<State, any, any>) => {
    return {
        onA: (a) => dispatch(a),
    }
};