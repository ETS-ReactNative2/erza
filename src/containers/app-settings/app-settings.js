import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import Tickbox from '../../components/tickbox/tickbox';
import {setApplicationTheme, toggleTimedTheme} from '../../actions/theme'
import {Strings} from '../../constants/values'
import {Paths} from '../../constants/paths'
import {getTimeoutMinutes} from '../../utils/common'

let timedTheme;
const applyThemeToBody = theme => document.body.className = theme;
const setTimedThemeCheck = (theme, updateTheme) => {
  fetch(Paths.sunrise_sunset)
    .then(response => response.json())
    .then(json => {
      let timedThemeShade;
      const { sunrise, sunset } = json.results;
      
      clearTimeout(timedTheme);
      timedTheme = setTimeout(() => {
        const start = new Date(sunrise).getTime();
        const end = new Date(sunset).getTime();
        const now = Date.now();
        timedThemeShade = (start < now && now < end) ? Strings.light : Strings.dark;
        if (theme !== themes.find(x => x.name === timedThemeShade).class) return updateTheme(timedTheme);
      }, getTimeoutMinutes(5));
    })
    .catch(error => console.error(error));
}

const AppSettings = ({ theme, isTimed, setApplicationTheme, toggleTimedTheme }) => {
  const themes = Strings.themes.slice(0);
  applyThemeToBody(theme);
  if (isTimed) setTimedThemeCheck(theme, setApplicationTheme);
  
  return (
    <div id="app-settings">
      <button type="button"
              title="App settings"
              className="button-icon ripple"
              icon="&#x2699;">
      </button>
      <ul className="dropdown-menu" role="menu">
        <li className="dropdown-arrow"></li>
        <li className="button-group">
          {
            themes.map(item => (
              <button key={item.class}
                      type="button"
                      role="menuitem"
                      className="button"
                      onClick={() => setApplicationTheme(item.class)}
                >
                { item.name }
              </button>
            ))
          }
        </li>
        <li>
          <Tickbox text="timed theme change"
                   name="isTimed"
                   checked={isTimed}
                   onChange={() => toggleTimedTheme()}
          />
        </li>
      </ul>
    </div>
  );
}

AppSettings.propTypes = {
  theme: PropTypes.string.isRequired,
  isTimed: PropTypes.bool.isRequired,
  setApplicationTheme: PropTypes.func.isRequired,
  toggleTimedTheme: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({ 
  theme: state.theme.class,
  isTimed: state.theme.isTimed
})

const mapDispatchToProps = ({ 
  setApplicationTheme,
  toggleTimedTheme
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppSettings)
