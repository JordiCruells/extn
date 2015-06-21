suite('Global test', function() {
	setup(function(){
		
	});

	test('page has a valid title', function(done) {
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO', "page has no valid title");		
    done();
	});

	teardown(function(){
		
	});

  
});