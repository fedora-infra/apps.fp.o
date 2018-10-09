$.ajax({ method: 'GET', url: '../data/data.json' }).done(data => {
    $(document).ready(function () {
        $('#header').text(data.name);
        $('#subheader').html(data.data.description);
        let bodyprototype = []
        let cardprototype = []
        let iconprototype = ""
        $.each(data.children, (index, category) => {
            cardprototype = [];
            cardprototype.push(...['<div class="col-sm pb-4">', '<div class="card" id="' + String(String(category.name).toLowerCase()).replace(" ", "") + '">', '<div class="card-header">', '<div class="card-title" data-toggle="popover" data-content="' + category.data.description + '">', category.name, '</div>', '</div>', '<div class="card-block">', '<ul class="list-group list-group-flush">']);
            $.each(category.children, (index, item) => {
                if (item.data.icon) {
                    iconprototype = '<div class="icon"><span class="helper"><img src="' + '/img/icons/' + item.data.icon + '" height="42" width="42"></span></div>'
                } else {
                    iconprototype = ""
                }
                cardprototype.push(...['<li class="list-group-item">', iconprototype, '<div>', '<a href="' + item.data.url + '">', item.name, '</a>', ' - ', item.data.description, '</div>', '</li>'])
            });
            cardprototype.push(...['</ul>', '</div>', '</div>', '</div>']);
            bodyprototype.push(...cardprototype);
        });
        $('.bodycontent').html(bodyprototype.join(""));
        $('[data-toggle="popover"]').popover({ trigger: 'hover' })
    });
});
