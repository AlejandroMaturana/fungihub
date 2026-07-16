import FilterBar from '../../../shared/components/FilterBar'

const RESOURCES = ['', 'user', 'device', 'sensor', 'actuator', 'recipe', 'cycle', 'alarm', 'api_key', 'system']
const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'USER_ROLE_CHANGE', 'USER_TOGGLE_ACTIVE', 'API_KEY_CREATE', 'API_KEY_REVOKE', 'API_KEY_ROTATE', 'PASSWORD_CHANGE']

function LogFilters({ filters, onChange }) {
  return (
    <FilterBar>
      <FilterBar.Field label="Search">
        <input
          type="text"
          className="input"
          placeholder="Search logs..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
      </FilterBar.Field>
      <FilterBar.Field label="Resource">
        <select className="select" value={filters.resource || ''} onChange={e => onChange({ ...filters, resource: e.target.value })}>
          {RESOURCES.map(r => <option key={r} value={r}>{r || 'All Resources'}</option>)}
        </select>
      </FilterBar.Field>
      <FilterBar.Field label="Action">
        <select className="select" value={filters.action || ''} onChange={e => onChange({ ...filters, action: e.target.value })}>
          {ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
        </select>
      </FilterBar.Field>
      <FilterBar.Field label="From">
        <input type="date" className="input" value={filters.from || ''} onChange={e => onChange({ ...filters, from: e.target.value })} />
      </FilterBar.Field>
      <FilterBar.Field label="To">
        <input type="date" className="input" value={filters.to || ''} onChange={e => onChange({ ...filters, to: e.target.value })} />
      </FilterBar.Field>
    </FilterBar>
  )
}

export default LogFilters
