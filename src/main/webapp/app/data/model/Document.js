Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    //requires: ['Voyant.data.store.DocumentTerms'],
    fields: [
             {name: 'corpus'},
             {name: 'id'},
             {name: 'index', type: 'int'},
             {name: 'tokensCount-lexical', type: 'int'},
             {name: 'typesCount-lexical', type: 'int'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }},
             {name: 'lastTokenStartOffset-lexical', type: 'int'},
             {name: 'title'},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getLexicalTokensCount: function() {
    	return this.get('tokensCount-lexical')
    },
    
    getLexicalTypeTokenRatio: function() {
    	return this.get('typeTokenRatio-lexical')
    },
    
    loadDocumentTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var documentTerms = this.getDocumentTerms();
			documentTerms.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(documentTerms)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    loadTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var tokens = this.getTokens(config);
			tokens.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(tokens)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    getTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	Ext.apply(config, {
	    		docId: this.get('id')
	    	});
	    	return this.get('corpus').getTokens(config);
//	    	return new Voyant.data.store.Tokens(config);
		}
    },

    getDocumentTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	if (config.corpus) {
	    		return config.corpus.getDocumentTerms(config);
	    	}
	    	return this.get('corpus').getDocumentTerms(config); // FIXME: when does this happen?
		}
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getId: function() {
    	return this.get('id');
    },
    
    getFullLabel: function() {
    	var author = this.getAuthor();
    	return this.getTitle() + (author ? "("+author+")" : ''); // TODO: complete full label
    },
    
    getTitle: function() {
    	var title = this.get('title');
    	if (title === undefined) title = '';
    	title = Ext.isArray(title) ? title.join("; ") : title;
    	title = title.trim().replace(/\s+/g, ' '); // remove excess whitespace
    	return title;
    },
    
    getTruncated: function(string, max) {
  		if (string.length > max) {
				// maybe a file or URL?
				var slash = string.lastIndexOf("/");
				if (slash>-1) {
					string = string.substr(slash+1);
				}
				
				if (string.length>max) {
					var space = string.indexOf(" ", max-5);
					if (space < 0 || space > max) {
						space = max;
					}
					string = string.substring(0, space) + "…";
				}
		}
  		return string;
    	
    },
    
    getShortTitle: function() {
     	var title = this.getTitle();
     	title = title.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
     	title = title.replace(/^(the|a|le|l'|un|une)\s/,'');
     	return this.getTruncated(title, 25);
    },
    
    getTinyTitle: function() {
    	return this.getTruncated(this.getShortTitle(), 10);
    },
    
    getShortLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getShortTitle();
    },
    
    getTinyLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getTinyTitle();
    },
    
    getAuthor: function() {
    	var author = this.get('author') || "";
    	author = Ext.isArray(author) ? author.join("; ") : author;
    	author = author.trim().replace(/\s+/g, ' ');
    	return author;
    },
    
    getCorpusId: function() {
    	return this.get('corpus');
    },
    
    isPlainText: function() {
    	if (this.get("extra.Content-Type") && new RegExp("plain","i").test(this.get("extra.Content-Type"))) {
    		return true
    	}
    	return false;
    },
    
    show: function() {
    	show(this.getFullLabel())
    }
    
});