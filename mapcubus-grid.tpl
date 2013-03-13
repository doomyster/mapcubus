        <form id="save_form">
            <fieldset>
                <label for="name">Level name</label>
                <input type="text" name="level_name_save" id="level_name_save" class="text ui-widget-content ui-corner-all" />
            </fieldset>
        </form>
        <form id="load_form">
            <fieldset>
		<label for="name">Level name</label>
		<div id="levels_list">
			<ul id="levels_load_list">
			</ul>
		</div>
                <input type="hidden" name="level_name_load" id="level_name_load" class="text ui-widget-content ui-corner-all" />
            </fieldset>
        </form>

        <div>
            <input type="button" title="save map on server" id="commit-distant" value="Save" />
            <input type="button" title="load map from server" id="revert-distant" value="Load" />
            <input type="button" title="save changes locally" id="commit-local" value="Commit" />
            <input type="button" title="load last local save" id="revert-local" value="Revert" />
        </div>
        <div>
            <input type="button" title="moves all tiles to the left" id="all-move-left" value="<<" />
            <input type="button" title="moves all tiles upward" id="all-move-up" value="^" />
            <input type="button" title="moves all tiles downward" id="all-move-down" value="V" />
            <input type="button" title="moves all tiles to the right" id="all-move-right" value=">>" />
        </div>

        <div id="accordeon">
            <?= $liste; ?>
        </div>
        <div id="contenu">
            <div class="scr">
                <?= $contenu; ?>
            </div>
        </div>

	<div id="grid-options" class="ui-state-default">
		<input type="checkbox" id="show-grid" name="show-grid" checked="checked" /><label id="show-grid-label" for="show-grid">show grid</label>
	</div>

	<ul id="context-menu-options">
	  <li><a id="delete-tile-link" href="#">Supprimer</a></li>
	</ul>
