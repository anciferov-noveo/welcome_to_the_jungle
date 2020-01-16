import get from 'lodash.get';
import { createSelector } from 'reselect';

import { parseQueryString } from 'helpers/queryStringHelper';
import { dateStringToTimeStamp } from 'helpers/moment';
import { selectQueryString } from 'ducks/router/selectors';


export const selectContractTypeReference = createSelector(
  (state) => get(state, 'offers.contractTypes'),
  (contractTypes = []) => contractTypes.map((item) => ({
    value: item,
    label: item,
  })),
);

const filtersRules = {
  search: (string, item) => get(item, 'name').includes(string),
  contractTypes: (string, item) => get(item, 'contract_type.en').includes(string),
  date: (dateString, item) => dateStringToTimeStamp(get(item, 'published_at')) >= dateStringToTimeStamp(dateString),
  groupBy: (attr = {}, item) => get(item, `${attr.type}.id`) === Number(attr.id),
};

const searchFilter = (filteredState = {}, item) => Object.keys(filteredState)
  .every((filterKey) => {
    if (typeof filtersRules[filterKey] !== 'function') {
      return true;
    }
    return filtersRules[filterKey](filteredState[filterKey], item);
  });


export const selectOffersWithFilters = createSelector(
  (state) => get(state, 'offers.offers'),
  (state) => selectQueryString(state),
  (state) => get(state, 'offers.publishedTimes'),
  (offers = {}, filterString) => {
    const filtersState = parseQueryString(filterString);
    return Object.values(offers).filter((item) => searchFilter(filtersState, item));
  },
);


export const selectPublishedTimes = createSelector(
  (state) => get(state, 'offers.publishedTimes'),
  (publishedTimes = []) => publishedTimes.map((item) => ({
    value: item,
    label: item,
  })).sort(),
);

const selectAttributesByGroup = (state) => get(state, 'offers.attributesGroup');

export const selectAttributesByGroupToSelect = createSelector(
  selectAttributesByGroup,
  (attributesGroups = {}) => Object.values(attributesGroups).map((item) => ({
    value: item.id,
    label: `${item.type} - ${item.name}`,
    type: item.type,
  })),
);
