 // Sistema de filtros
export class FilterEngine {
  constructor(data = []) {
    this.data = data;
    this.filters = {};
    this.searchQuery = '';
    this.sortBy = null;
  }

  addFilter(key, value) {
    this.filters[key] = value;
  }

  removeFilter(key) {
    delete this.filters[key];
  }

  addAdvancedFilter(key, operator, value) {
    this.filters[`${key}:${operator}`] = value;
  }

  apply() {
    let result = this.data;

    // Aplicar filtros
    result = result.filter(item => {
      return Object.entries(this.filters).every(([key, value]) => {
        if (key.includes(':')) {
          const [field, operator] = key.split(':');
          return this.applyOperator(item[field], operator, value);
        }
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });

    // Aplicar búsqueda
    if (this.searchQuery) {
      result = result.filter(item => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }

    // Aplicar ordenamiento
    if (this.sortBy) {
      result.sort((a, b) => {
        const [field, order] = this.sortBy;
        const mult = order === 'desc' ? -1 : 1;
        return (a[field] > b[field] ? 1 : -1) * mult;
      });
    }

    return result;
  }

  applyOperator(value, operator, compareValue) {
    switch (operator) {
      case 'gt': return value > compareValue;
      case 'gte': return value >= compareValue;
      case 'lt': return value < compareValue;
      case 'lte': return value <= compareValue;
      case 'contains': return String(value).includes(compareValue);
      case 'startswith': return String(value).startsWith(compareValue);
      case 'endswith': return String(value).endsWith(compareValue);
      default: return value === compareValue;
    }
  }

  search(query) {
    this.searchQuery = query;
    return this.apply();
  }

  sort(field, order = 'asc') {
    this.sortBy = [field, order];
    return this.apply();
  }

  clearFilters() {
    this.filters = {};
    this.searchQuery = '';
    this.sortBy = null;
  }
}

export function createFilterEngine(data = []) {
  return new FilterEngine(data);
}
