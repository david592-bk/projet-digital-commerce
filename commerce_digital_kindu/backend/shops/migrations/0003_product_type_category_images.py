from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0002_product_currency'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='item_type',
            field=models.CharField(choices=[('product', 'Produit'), ('service', 'Service')], default='product', max_length=10),
        ),
        migrations.AddField(
            model_name='product',
            name='category',
            field=models.CharField(choices=[('aliment', 'Aliment'), ('vetement', 'Vêtement'), ('nettoyage', 'Produit de nettoyage'), ('beaute', 'Beauté'), ('autre', 'Autre')], default='autre', max_length=20),
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('photo', models.ImageField(blank=True, null=True, upload_to='product_photos/')),
                ('product', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='images', to='shops.product')),
            ],
        ),
    ]
