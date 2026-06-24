import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type Organisation = 'G2' | 'CG-Vak';

export interface OrganisationState {
  selectedOrganisation: Organisation | null;
}

const initialState: OrganisationState = {
  selectedOrganisation: null,
};

const organisationSlice = createSlice({
  name: 'organisation',
  initialState,
  reducers: {
    selectOrganisation(state, action: PayloadAction<Organisation>) {
      state.selectedOrganisation = action.payload;
    },
    clearOrganisation(state) {
      state.selectedOrganisation = null;
    },
  },
});

export const {selectOrganisation, clearOrganisation} = organisationSlice.actions;
export default organisationSlice.reducer;
