suite('"About" page test', function() {
	setup(function(){
		
	});

	test('page should contain link to contact page', function(done) {
		assert($('a[href="/contact"]').length);	
		done();	
	});

	teardown(function(){
		
	}); 

	

	

  
});