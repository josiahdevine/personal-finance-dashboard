exports.up = async function(knex) {
    await knex.schema.createTable('cash_flow_predictions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.date('prediction_date').notNullable();
        table.decimal('predicted_amount', 15, 2).notNullable();
        table.string('category').notNullable();
        table.string('prediction_type').notNullable(); // 'recurring' or 'pattern'
        table.decimal('confidence_score', 5, 2); // Optional confidence score
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Indexes
        table.index(['user_id', 'prediction_date']);
        table.index(['prediction_date']);
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('cash_flow_predictions');
}; 