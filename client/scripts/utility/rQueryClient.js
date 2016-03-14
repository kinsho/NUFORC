// ----------------- MODULE -----------------------------

var rQueryClient =
{
	/**
	 * Function that finds the closest ancestor of an element that matches a given tag name
	 *
	 * @param {HTMLElement} el - the element from which to begin the search
	 * @param {String} tagName - the tag name that will guide the search for the closest ancestor
	 *
	 * @returns {HTMLElement} - the closest ancestor (of the passed element) that can be classified by the passed
	 * 		tag name
	 *
	 * @author kinsho
	 */
	closestElementByTag: function (el, tagName)
	{
		var parent = el.parentNode;

		while (parent)
		{
			if (parent.tagName === tagName.toUpperCase())
			{
				return parent;
			}

			parent = parent.parentNode;
		}
	}
};

// ----------------- EXPORT -----------------------------

export default rQueryClient;