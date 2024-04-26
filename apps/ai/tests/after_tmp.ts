import { State } from 'state';

const mapStateToProps = (state: State) => ({
    a: selectA(state),
});