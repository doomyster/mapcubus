<div id="map-options">
        <form id="save-form">
            <fieldset>
                <label for="name">Level name</label>
                <input type="text" name="level-name-save" id="level-name-save" class="text ui-widget-content ui-corner-all" />
            </fieldset>
        </form>
        <form id="load-form">
            <fieldset>
		<label for="name">Level name</label>
		<div id="levels-list">
			<ul id="levels-load-list">
			</ul>
		</div>
                <input type="hidden" name="level-name-load" id="level-name-load" class="text ui-widget-content ui-corner-all" />
            </fieldset>
        </form>

        <div>
            <input type="button" title="save map on server" id="button-commit-distant" value="Save" />
            <input type="button" title="load map from server" id="button-revert-distant" value="Load" />
            <input type="button" title="save changes locally" id="button-commit-local" value="Commit" />
            <input type="button" title="load last local save" id="button-revert-local" value="Revert" />
        </div>
        <div>
            <input type="button" title="moves all tiles to the left"  id="button-all-move-left" value="<<" />
            <input type="button" title="moves all tiles upward"       id="button-all-move-up" value="^" />
            <input type="button" title="moves all tiles downward"     id="button-all-move-down" value="V" />
            <input type="button" title="moves all tiles to the right" id="button-all-move-right" value=">>" />
        </div>

        <div id="menu-accordion">
            <?= $liste; ?>
        </div>
</div>

<div id="grid-wrapper">
    <div class="grid-container">
	<?= $contenu; ?>
    </div>
</div>

<div id="grid-options" class="ui-state-default ui-corner-all">
	<input type="checkbox" id="show-grid" name="show-grid" checked="checked" /><label id="show-grid-label" for="show-grid">show grid</label>
</div>

<ul id="context-menu-options">
  <li><a id="delete-tile-link" href="#">Supprimer</a></li>
  <li><a id="set-zone-0-link" href="#">Set zone (0)</a></li>
  <li><a id="set-zone-1-link" href="#">Set zone (1)</a></li>
  <li><a id="set-zone-2-link" href="#">Set zone (2)</a></li>
  <li><a id="set-zone-3-link" href="#">Set zone (3)</a></li>
  <li><a id="set-zone-4-link" href="#">Set zone (4)</a></li>
  <li><a id="set-zone-5-link" href="#">Set zone (5)</a></li>
  <li><a id="set-zone-6-link" href="#">Set zone (6)</a></li>
  <li><a id="set-zone-7-link" href="#">Set zone (7)</a></li>
  <li><a id="set-zone-8-link" href="#">Set zone (8)</a></li>
  <li><a id="set-zone-9-link" href="#">Set zone (9)</a></li>
</ul>
