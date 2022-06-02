export default class TogarashiToken extends Token {
    _canViewMode(mode) {
        if (mode === CONST.TOKEN_DISPLAY_MODES.NONE) return false;
        else if (mode === CONST.TOKEN_DISPLAY_MODES.ALWAYS) return true;
        else if (mode === CONST.TOKEN_DISPLAY_MODES.CONTROL) return this._controlled;
        else if (mode === CONST.TOKEN_DISPLAY_MODES.HOVER) return this._hover;
        else if (mode === CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER) return game.user.isGM && this._hover;
        else if (mode === CONST.TOKEN_DISPLAY_MODES.OWNER) return game.user.isGM;
    }
}
